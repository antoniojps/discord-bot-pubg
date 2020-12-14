import { Guild, RoleData } from 'discord.js';

type Roles = RoleData[];

export const RANKS = {
  MASTER: 'Master',
  DIAMOND: 'Diamond',
  PLATINUM: 'Platinum',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE: 'Bronze',
};

export const ADR = {
  '-100': '-100 ADR',
  '+100': '+100 ADR',
  '+150': '+150 ADR',
  '+200': '+200 ADR',
  '+250': '+250 ADR',
  '+300': '+300 ADR',
  '+350': '+350 ADR',
  '+400': '+400 ADR',
  '+450': '+450 ADR',
  '+500': '+500 ADR',
};

export const KD = {
  '-0.5': '-0.5 KD',
  '+0.5': '+0.5 KD',
  '+1': '+1 KD',
  '+1.5': '+1.5 KD',
  '+2': '+2 KD',
  '+2.5': '+2.5 KD',
  '+3': '+3 KD',
  '+3.5': '+3.5 KD',
  '+4': '+4 KD',
  '+4.5': '+4.5 KD',
  '+5': '+5 KD',
};

const ROLES: Roles = [
  { name: RANKS.MASTER, color: [47, 204, 113] },
  { name: RANKS.DIAMOND, color: [193, 124, 13] },
  { name: RANKS.PLATINUM, color: [33, 103, 148] },
  { name: RANKS.GOLD, color: [214, 177, 99] },
  { name: RANKS.SILVER, color: [121, 138, 150] },
  { name: RANKS.BRONZE, color: [153, 110, 86] },
  { name: ADR['-100'], color: [125, 225, 127], hoist: true },
  { name: ADR['+100'], color: [125, 225, 127], hoist: true },
  { name: ADR['+150'], color: [125, 225, 127], hoist: true },
  { name: ADR['+200'], color: [125, 225, 127], hoist: true },
  { name: ADR['+250'], color: [164, 196, 13], hoist: true },
  { name: ADR['+300'], color: [237, 154, 32], hoist: true },
  { name: ADR['+350'], color: [237, 154, 32], hoist: true },
  { name: ADR['+400'], color: [234, 120, 44], hoist: true },
  { name: ADR['+450'], color: [234, 120, 44], hoist: true },
  { name: ADR['+500'], color: [230, 76, 61], hoist: true },
  { name: KD['-0.5'], color: [147, 112, 219] },
  { name: KD['+0.5'], color: [147, 112, 219] },
  { name: KD['+1'], color: [147, 112, 219] },
  { name: KD['+1.5'], color: [147, 112, 219] },
  { name: KD['+2'], color: [147, 112, 219] },
  { name: KD['+2.5'], color: [147, 112, 219] },
  { name: KD['+3'], color: [147, 112, 219] },
  { name: KD['+3.5'], color: [147, 112, 219] },
  { name: KD['+4'], color: [147, 112, 219] },
  { name: KD['+4.5'], color: [147, 112, 219] },
  { name: KD['+5'], color: [147, 112, 219] },
];

export default async (guild: Guild) => {
  // // delete
  // await Promise.race(
  //   guild.roles.cache.map(async (r) => {
  //     if (r.name !== 'Supreme bot') await r.delete();
  //   }),
  // );

  const createRolesPromises = ROLES.filter((role) => {
    const alreadyExists = guild.roles.cache.find((r) => r.name === role.name);
    if (alreadyExists) return false;
    return guild.roles.create({ data: role });
  });

  await Promise.all(createRolesPromises);
  console.log('Roles created');
};
