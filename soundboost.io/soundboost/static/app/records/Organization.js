import * as I from "immutable";


const record = I.Record({
  name: null,
  slug: null,
  averageResponseTime: null,
  submissionsToday: null,
  approveRate: null,
});

record.prototype.naturalResponseTime = function() {
  if (this.averageResponseTime) {
    const days = parseInt(this.averageResponseTime / 86400, 10);
    const hours = parseInt(this.averageResponseTime / 3600, 10);
    const minutes = parseInt(this.averageResponseTime / 60, 10);
    if (hours < 1) {
      return `${minutes} minutes`;
    } else if (days < 1) {
      return `${hours} hours`;
    }
    return `${days} days`;
  }
  return null;
};

record.fromAPI = (item) => {
  const {name, slug} = item;
  return new record({
    name,
    slug,
    averageResponseTime: item.average_response_time,
    submissionsToday: item.submissions_today,
    approveRate: item.approval_rate,
  });
};


export default record;
