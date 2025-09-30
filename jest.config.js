import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './'
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}

// Export ESM config for Jest under ESM (package.json "type": "module")
export default createJestConfig(customJestConfig)
