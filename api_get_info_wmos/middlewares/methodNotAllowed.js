
module.exports = (allowed = []) => (req, res) => {
  res.set('Allow', allowed.join(', '));
  return res
    .status(405)
    .json({ error: 'Method Not Allowed :(', allowed });
};
