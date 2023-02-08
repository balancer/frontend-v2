name: Compile - [ ] Comments
 - name: Remove existing - [ ].md file
 run: rm - [ ].md || echo "TODO.md does not exist"
 - name: Create - [ ] file
 run: touch - [ ].md
 - name: Extract - [ ] comments
 # Extract all - [ ] comments into a file, excluding todo.yml file in /.github/workflows
 grep -r -E --exclude={- [ ].md,/.github/workflows/todo.yml} 'TODO' . | while read line; do
 todo="$(echo $line | cut -d ':' -f 2- | sed 's/- [ ]/- [ ]/')"
 echo "$todo" >> - [ ].md
 - name: Commit - [ ] file
 add: '- [ ].md'
 message: 'Update - [ ].md file'
// - [ ]: Don't refetch whole pool, only update balances and weights with
// - [ ]: Don't refetch whole pool, only update balances and weights with
// - [ ]: move to sor mocks to subfile
//- [ ]: Improve builder to avoid DeepPartial
//- [ ]: why mock is not working
 // - [ ]: discover how we can discover different calls and responses
// - [ ]: Fix types
 Dockerfile Dockerfile.dev LICENSE README.md - [ ].md auto-imports.d.ts components.d.ts crowdin.yml docker-compose.yml env.d.ts index.html package-lock.json package.json postcss.config.js prepare.js public scripts src stylelint.config.js tailwind.config.js tests tsconfig.json vercel-production-build.sh vite.config.ts TODO:
 .times(1 - protocolFeePercentage) // - [ ]: check pool type and use protocol yield percentage cache when applicable
 // - [ ] BETTER INTEGRATION OF REWARD TOKEN APRS
 // - [ ]: do this more elegantly
 // - [ ] type this
 // - [ ] type this
 // - [ ] type this
 // - [ ] type this
 // - [ ] type this
 // - [ ]: Fix affected tests by refactoring export balancerContractsService
 ? // - [ ]: Fix this in the SDK, then remove this toLowerCase
 // - [ ]: blocknative is going to be deprecated for transaction tracking.
//- [ ]: FIX THIS
// - [ ]: What happens if the structure changes? Either keep a version or schema validator.
