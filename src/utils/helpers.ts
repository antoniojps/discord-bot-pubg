export const findClosestNumber = (available: number[], goal: number): number =>
  available.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });

export const parseUserIdFromMention = (message: string): string | null => {
  const match = message.match('<@(.*)>');
  return match && match[1] ? match[1] : null;
};
