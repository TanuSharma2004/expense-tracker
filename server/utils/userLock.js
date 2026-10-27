// Runs async jobs for the same key (a user id) one at a time, in order.
// Jobs for different users still run in parallel.
const tails = new Map(); // key -> promise for the last job queued for that key

function withUserLock(key, job) {
  const previous = tails.get(key) || Promise.resolve();
  const result = previous.then(job); // starts only after the previous job has finished
  const tail = result.catch(() => {}); // a failed job must not block the jobs behind it
  tails.set(key, tail);
  tail.then(() => {
    if (tails.get(key) === tail) tails.delete(key); // nothing queued behind us: clean up
  });
  return result; // the caller still sees this job's own result or error
}

module.exports = { withUserLock };
