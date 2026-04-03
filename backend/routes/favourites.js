const router = require('express').Router();
const db = require('../db');
const properties = require('../properties');

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT property_id FROM favourites WHERE user_id = ?')
    .all(req.user.id);

  const ids = new Set(rows.map(r => r.property_id));
  const favs = properties.filter(p => ids.has(p.id));

  res.json(favs);
});

router.post('/:propertyId', (req, res) => {
  const { propertyId } = req.params;

  const property = properties.find(p => p.id === propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  try {
    db.prepare('INSERT INTO favourites (user_id, property_id) VALUES (?, ?)').run(
      req.user.id,
      propertyId
    );
    res.status(201).json({ message: `${property.title} added to favourites` });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Already in your favourites' });
    }
    throw err;
  }
});

router.delete('/:propertyId', (req, res) => {
  const { propertyId } = req.params;

  const result = db
    .prepare('DELETE FROM favourites WHERE user_id = ? AND property_id = ?')
    .run(req.user.id, propertyId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Property not in your favourites' });
  }

  res.json({ message: 'Removed from favourites' });
});

module.exports = router;
