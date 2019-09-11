#!/usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');
const spawn = require('cross-spawn');
program.version(pkg.version);


/**
 * Finds Local NPM Packages
 */
const findLocalPackages = () => spawn.sync('cross-env', [
    'npm_config_loglevel=silent',
    'npm', 'list', '--json', '--depth', '0'
]);
/**
 * Finds Global NPM Packages
 */
const findGlobalPackages = () => spawn.sync('cross-env', [
    'npm_config_loglevel=silent',
    'npm', 'list', '--json', '-g', '--depth', '0'
]);

// Get the Packages
const localPkgs = JSON.parse(findLocalPackages().stdout);
const globalPkgs = JSON.parse(findGlobalPackages().stdout);

// Combine the results
const pkgList = {...localPkgs.dependencies, ...globalPkgs.dependencies};

// Example Package Export to be included in the CLI
const pkgTest = {
    commands: {
        start: {
            name: 'hospitalrun-frontend-start',
            description: 'Start the frontend'
        }
    }
};

// Lazy Load any commands that are available
// NOTE: We can hardcode the commands to make the cli faster or present a spinner while it fetches dependencies
Object.keys(pkgList)
    .filter((pkg: any) => {
    return pkg.match('@hospitalrun') && !pkg.match('@hospitalrun-org/cli')
    })
    .forEach((pkg: string) => {
        try{
            let mod = require(pkg)

            if (typeof mod.commands !== 'undefined') {
                Object.keys(mod.commands).forEach((cmd: any) => {
                    program.command(
                        cmd,
                        mod.commands[cmd].description,
                        {executableFile: mod.commands[cmd].name}
                    )
                })
            }
        } catch(err){
            console.log(`${err} loading ${pkg}`)
        }

    });

// Run the Program
program.parse(process.argv)

// Export for testing
export {pkg, program}