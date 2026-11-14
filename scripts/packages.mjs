// The published packages, in the order they depend on each other.
export const PACKAGES = [
    { name: '@pyas/connect-core', dir: 'packages/connect-core', publishDir: 'packages/connect-core' },
    { name: '@pyas/connect', dir: 'packages/connect', publishDir: 'packages/connect' },
    { name: '@pyas/connect-react', dir: 'packages/connect-react', publishDir: 'packages/connect-react' },
    { name: '@pyas/connect-vue', dir: 'packages/connect-vue', publishDir: 'packages/connect-vue' },
    // ng-packagr writes the publishable package into dist.
    { name: '@pyas/connect-angular', dir: 'packages/angular-workspace/projects/connect-angular', publishDir: 'packages/angular-workspace/projects/connect-angular/dist' },
]
