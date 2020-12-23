export const HelpMessageLfs = (channel: string) =>
  `
Para  procurar uma squad entra numa sala e escreve \`lfs\` no canal ${channel}, se tiveres solo não precisas estar numa sala. Podes adicionar uma nota ao pedido com \`lfs "nota"\`.  Se alguém reagir ao teu pedido ✉️ serás notificado por mensagem privada pelo bot 🤖. Se pretendes cancelar a procura escreve \`-\`.
`;

export const HelpMessageDefault = (rolesChannel: string, lfsChannel: string, availableRoles: string[]) => `
Olá! Sou um 🤖 bot desenvolvido para a comunidade portuguesa de PUBG de modo a facilitar a procura de jogadores.

Neste canal ${rolesChannel} escreve \`/link PUBG_NICKNAME\` substituindo \`PUBG_NICKNAME\` pelo nome da tua conta de modo a receber os roles e stats no discord.
${HelpMessageLfs(lfsChannel)}
Usa \`/update\` no canal ${rolesChannel} para atualizar as estatísticas.
Usa \`/role "NOME_DA_ROLE"\` no canal ${rolesChannel} para adicionar ou remover uma role. Roles disponíveis: ${availableRoles
  .map((r) => `\`"${r}"\``)
  .join(',')}
Usa \`/help\` em cada canal para obter ajuda.
`;

export const HelpMessageAdmin = () => `
Enquanto admin tens acesso a alguns comandos adicionais para usar neste canal.

\`/link PUBG_NICKNAME DISCORD_ID\`, associa uma conta de pubg a uma conta do discord, se outro utilizador associou a conta anteriormente remove as roles deste.

\`/unlink PUBG_NICKNAME\`, desassocia um utilizador do discord a uma conta de PUBG, remove as roles de stats deste.

Neste canal também aparecem os erros que surgem para efeito de debug e monitorização.
`;
