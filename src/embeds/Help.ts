export const HelpMessageLfs = () => `
Para começares a procurar uma squad entra numa sala e escreve \`lfs\` no canal **#looking-for-someone**, se tiveres solo não precisas estar numa sala. Podes adicionar uma nota ao pedido com \`lfs "nota"\`.

Se alguém reagir ao teu pedido ✉️ serás notificado por mensagem privada pelo bot 🤙
`;

export const HelpMessageDefault = () => `
Olá! Sou um 🤖 bot desenvolvido para a comunidade portuguesa de PUBG de modo a facilitar a procura de jogadores.

Para começar no canal **#roles** escreve \`/link PUBG_NICKNAME\` substituindo \`PUBG_NICKNAME\` pelo nome da tua conta de modo a receber os roles e stats no discord.

${HelpMessageLfs()}

Para atualizar as tuas roles usa \`/update\` no canal **#roles**.
`;

export const HelpMessageAdmin = () => `
Enquanto admin tens acesso a alguns comandos adicionais.

\`/link PUBG_NICKNAME DISCORD_ID\`, associa uma conta de pubg a uma conta do discord, se outro utilizador associou a conta anteriormente remove as roles deste.

\`/unlink PUBG_NICKNAME\`, desassocia um utilizador do discord a uma conta de PUBG, remove as roles de stats deste.

Neste canal também aparecem os erros que surgem para efeito de debug e monitorização.
`;
