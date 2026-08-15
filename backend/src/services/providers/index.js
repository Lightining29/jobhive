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
const LeverProvider = require('./lever.provider');
const InternshalaProvider = require('./internshala.provider');

const getProviders = () => {
  const providers = [
    new GreenhouseProvider(),
    new AshbyProvider(),
    new LeverProvider(),
    new AmazonProvider(),
    new HimalayasProvider(),
    new JobicyProvider(),
    new InternshalaProvider(),
    new ArbeitnowProvider(),
    new RemotiveProvider(),
    new MuseProvider(),
    new JoobleProvider(),
    new AdzunaProvider(),
  ];
  const adzunaIn = new AdzunaProvider('in');
  if (adzunaIn.isEnabled()) providers.splice(providers.length - 1, 0, adzunaIn);
  return providers;
};

module.exports = { getProviders };
