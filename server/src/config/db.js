import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import child_process from 'node:child_process';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedInitialData } from './seedData.js';

// Patch DNS SRV/TXT on Windows when Node c-ares fails to resolve Atlas hostnames
if (process.platform === 'win32') {
  const resolveSrvNative = (hostname) => {
    const cmd = `(Resolve-DnsName -Type SRV ${hostname}).NameTarget`;
    const out = child_process.execSync(`powershell -NoProfile -Command "${cmd}"`, { encoding: 'utf8' }).trim();
    const hosts = out.split(/\r?\n/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean);
    if (!hosts.length) throw new Error('No SRV records found');
    return hosts.map(h => ({ name: h, port: 27017, priority: 0, weight: 0 }));
  };

  const resolveTxtNative = (hostname) => {
    const cmd = `(Resolve-DnsName -Type TXT ${hostname}).Strings`;
    const out = child_process.execSync(`powershell -NoProfile -Command "${cmd}"`, { encoding: 'utf8' }).trim();
    const txts = out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (!txts.length) throw new Error('No TXT records found');
    return [txts];
  };

  const origResolveSrv = dns.resolveSrv.bind(dns);
  dns.resolveSrv = function (hostname, callback) {
    origResolveSrv(hostname, (err, records) => {
      if (!err && records && records.length) return callback(null, records);
      try {
        return callback(null, resolveSrvNative(hostname));
      } catch {
        return callback(err || new Error('Could not resolve SRV record'));
      }
    });
  };

  const origResolveTxt = dns.resolveTxt.bind(dns);
  dns.resolveTxt = function (hostname, callback) {
    origResolveTxt(hostname, (err, records) => {
      if (!err && records && records.length) return callback(null, records);
      try {
        return callback(null, resolveTxtNative(hostname));
      } catch {
        return callback(err || new Error('Could not resolve TXT record'));
      }
    });
  };

  const origPromiseResolveSrv = dnsPromises.resolveSrv.bind(dnsPromises);
  const origPromiseResolveTxt = dnsPromises.resolveTxt.bind(dnsPromises);

  const customPromiseResolveSrv = async function (hostname) {
    try {
      return await origPromiseResolveSrv(hostname);
    } catch {
      return resolveSrvNative(hostname);
    }
  };

  const customPromiseResolveTxt = async function (hostname) {
    try {
      return await origPromiseResolveTxt(hostname);
    } catch {
      return resolveTxtNative(hostname);
    }
  };

  dns.promises.resolveSrv = customPromiseResolveSrv;
  dns.promises.resolveTxt = customPromiseResolveTxt;
  dnsPromises.resolveSrv = customPromiseResolveSrv;
  dnsPromises.resolveTxt = customPromiseResolveTxt;
}

let mongodInstance = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;

  // 1. Attempt connection to primary configured URI (e.g. MongoDB Atlas)
  if (primaryUri) {
    try {
      console.log('Attempting MongoDB connection to configured URI...');
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('MongoDB connected successfully to configured URI');
      await seedInitialData();
      return;
    } catch (err) {
      console.warn('Configured MongoDB connection failed (' + err.message + '). Falling back to embedded local MongoDB...');
    }
  }

  // 2. Fallback to local / embedded MongoMemoryServer if Atlas is unreachable
  try {
    if (!mongodInstance) {
      console.log('Starting embedded local MongoDB instance...');
      mongodInstance = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 }
      });
    }
    const fallbackUri = mongodInstance.getUri() + 'startupme';
    await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected successfully to local embedded MongoDB');
    await mongoose.connection.collection('progresses').dropIndexes().catch(() => {});
    await seedInitialData();
  } catch (err) {
    console.error('All MongoDB connection attempts failed:', err.message);
    throw err;
  }
};
