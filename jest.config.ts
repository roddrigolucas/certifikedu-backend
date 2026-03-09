export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/test'], // Include both src and tests directories
  testRegex: '.*\\.spec\\.ts$', // Matches all `.spec.ts` files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
