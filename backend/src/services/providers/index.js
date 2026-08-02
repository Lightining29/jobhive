const JoobleProvider = require('./jooble.provider');
const AdzunaProvider = require('./adzuna.provider');
const ArbeitnowProvider = require('./arbeitnow.provider');
const RemotiveProvider = require('./remotive.provider');
const MuseProvider = require('./muse.provider');
const HimalayasProvider = require('./himalayas.provider');
const JobicyProvider = require('./jobicy.provider');
const GreenhouseProvider = require('./greenhouse.provider');
const AmazonProvider = require('./amazon.provider');
const AshbyProvider = require('./ashby.provider');
const InternshalaProvider = require('./internshala.provider');

const getProviders = () => {
  const providers = [
    new JoobleProvider(),
    new AdzunaProvider(),
    new ArbeitnowProvider(),
    new RemotiveProvider(),
    new MuseProvider(),
    new HimalayasProvider(),
    new JobicyProvider(),
    new GreenhouseProvider(),
    new AmazonProvider(),
    new AshbyProvider(),
    new InternshalaProvider(),
  ];
  const adzuna = new AdzunaProvider('in');
  if (adzuna.isEnabled()) providers.splice(1, 0, adzuna);
  return providers;
};

module.exports = { getProviders };
