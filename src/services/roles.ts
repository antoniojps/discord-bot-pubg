import { Guild, RoleData, GuildMember, Role } from 'discord.js';
import { Stats, PubgTier } from './pubg';
import { findClosestNumber } from '../utils/helpers';

type Roles = RoleData[];

export const RANKS: {
  [key: string]: PubgTier;
} = {
  Master: 'Master',
  Diamond: 'Diamond',
  Platinum: 'Platinum',
  Gold: 'Gold',
  Silver: 'Silver',
  Bronze: 'Bronze',
};

export const ADR = {
  '100': '100 ADR',
  '150': '150 ADR',
  '200': '200 ADR',
  '250': '250 ADR',
  '300': '300 ADR',
  '350': '350 ADR',
  '400': '400 ADR',
  '450': '450 ADR',
  '500': '500 ADR',
  '550': '+550 ADR',
};

export const KD = {
  '0.5': '0.5 KD',
  '1': '1 KD',
  '1.5': '1.5 KD',
  '2': '2 KD',
  '2.5': '2.5 KD',
  '3': '3 KD',
  '3.5': '3.5 KD',
  '4': '4 KD',
  '4.5': '4.5 KD',
  '5': '5 KD',
  '6': '+6 KD',
};

const ROLES: Roles = [
  { name: RANKS.Master, color: [0, 255, 109] },
  { name: RANKS.Diamond, color: [9, 249, 255] },
  { name: RANKS.Platinum, color: [33, 103, 148] },
  { name: RANKS.Gold, color: [214, 177, 99] },
  { name: RANKS.Silver, color: [121, 138, 150] },
  { name: RANKS.Bronze, color: [153, 110, 86] },
  { name: ADR['100'], color: [125, 225, 127], hoist: true },
  { name: ADR['150'], color: [125, 225, 127], hoist: true },
  { name: ADR['200'], color: [125, 225, 127], hoist: true },
  { name: ADR['250'], color: [164, 196, 13], hoist: true },
  { name: ADR['300'], color: [237, 154, 32], hoist: true },
  { name: ADR['350'], color: [237, 154, 32], hoist: true },
  { name: ADR['400'], color: [234, 120, 44], hoist: true },
  { name: ADR['450'], color: [234, 120, 44], hoist: true },
  { name: ADR['500'], color: [230, 76, 61], hoist: true },
  { name: ADR['550'], color: [230, 76, 61], hoist: true },
  { name: KD['0.5'], color: [147, 112, 219] },
  { name: KD['1'], color: [147, 112, 219] },
  { name: KD['1.5'], color: [147, 112, 219] },
  { name: KD['2'], color: [147, 112, 219] },
  { name: KD['2.5'], color: [147, 112, 219] },
  { name: KD['3'], color: [147, 112, 219] },
  { name: KD['3.5'], color: [147, 112, 219] },
  { name: KD['4'], color: [147, 112, 219] },
  { name: KD['4.5'], color: [147, 112, 219] },
  { name: KD['5'], color: [147, 112, 219] },
  { name: KD['6'], color: [147, 112, 219] },
];

type RoleGeneric = typeof RANKS | typeof KD | typeof ADR;

const computeRoleNameFromStats = (role: RoleGeneric, stat: number, type: 'KD' | 'ADR', max: number) => {
  const statNumbers = Object.keys(role).map((value) => Number(value));
  const statRoleClosest = findClosestNumber(statNumbers, stat);
  const statRole = statRoleClosest > max ? `+${statRoleClosest}` : statRoleClosest;
  return `${statRole} ${type}`;
};

export const removeRoles = async (member: GuildMember) => {
  const rolesToBeRemoved = member.roles.cache.filter((role) => {
    const statsRolesFound = ROLES.filter((r) => r.name === role.name);
    const statsRolesNamefound = statsRolesFound.map((roleFound) => roleFound.name);
    return statsRolesNamefound.includes(role.name);
  });
  const removeRolesPromises = rolesToBeRemoved.map((role) => member.roles.remove(role));
  await Promise.all(removeRolesPromises);
};

const addRoles = async (member: GuildMember, stats: Stats) => {
  const kdRoleName = computeRoleNameFromStats(KD, stats.kd, 'KD', 5);
  const adrRoleName = computeRoleNameFromStats(ADR, stats.avgDamage, 'ADR', 500);
  const rankRoleName = RANKS[stats.bestRank];
  const rolesNameToBeAssigned = [kdRoleName, adrRoleName, rankRoleName];
  const roles = await member.guild.roles.fetch();

  // add new stats roles
  const rolesToBeAssigned = roles.cache.filter((role) => {
    return rolesNameToBeAssigned.includes(role.name);
  });

  const addRolesPromises = rolesToBeAssigned.map((role) => member.roles.add(role));
  await Promise.all(addRolesPromises);
};

export const addStatsRoles = async (member: GuildMember, stats: Stats) => {
  // remove previous roles
  await removeRoles(member);
  await addRoles(member, stats);
};

export default async (guild: Guild) => {
  // delete
  // await Promise.race(
  //   guild.roles.cache.map(async (r) => {
  //     if (r.name !== 'Supreme bot') await r.delete();
  //   }),
  // );
  // console.log('roles deleted');

  const createRolesPromises = ROLES.filter((role) => {
    const alreadyExists = guild.roles.cache.find((r) => r.name === role.name, {});
    if (alreadyExists) return false;
    return guild.roles.create({ data: role });
  });
  await Promise.all(createRolesPromises);
};
