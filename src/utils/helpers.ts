export const findClosestNumber = (available: number[], goal: number): number =>
  available.reduce(function (prev, curr) {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
