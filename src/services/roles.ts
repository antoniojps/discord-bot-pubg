import { Guild, RoleData } from 'discord.js';

type Roles = RoleData[];

const ROLES_RANK: Roles = [
  { name: 'Master', color: [47, 204, 113] },
  { name: 'Diamond', color: [193, 124, 13] },
  { name: 'Platinum', color: [33, 103, 148] },
  { name: 'Gold', color: [214, 177, 99] },
  { name: 'Silver', color: [121, 138, 150] },
  { name: 'Bronze', color: [153, 110, 86] },
];

export default async (guild: Guild) => {
  const CreateRolesRankPromises = ROLES_RANK.filter((role) => {
    const alreadyExists = guild.roles.cache.find((r) => r.name === role.name);
    if (alreadyExists) return false;
    return guild.roles.create({ data: role });
  });
  await Promise.all(CreateRolesRankPromises);
  console.log('Roles created');
};
