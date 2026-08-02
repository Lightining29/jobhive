class ProviderError extends Error {
  constructor(message, { retryable = true, status = 500 } = {}) {
    super(message);
    this.retryable = retryable;
    this.status = status;
  }
}

class JobProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  isEnabled() {
    return true;
  }

  async fetch() {
    throw new Error(`${this.name}: fetch() not implemented`);
  }

  normalize(rawJob) {
    throw new Error(`${this.name}: normalize() not implemented`);
  }

  jobId(job) {
    return `${this.name}:${job.jobId}`;
  }
}

module.exports = { JobProvider, ProviderError };
