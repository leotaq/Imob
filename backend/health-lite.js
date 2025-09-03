module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true, ts: new Date().toISOString(), env: process.env.NODE_ENV || 'dev' }));
};
