const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Update useState for registeredAccounts and knownUsers to guarantee arrays
code = code.replace(
  /const \[registeredAccounts, setRegisteredAccounts\] = useState<UserAccountRecord\[\]>\(\(\) => \{\n\s*const saved = localStorage\.getItem\(AUTH_KEYS\.REGISTERED_ACCOUNTS\);\n\s*if \(saved\) \{\n\s*try \{ return JSON\.parse\(saved\); \} catch \(e\) \{ \/\* ignore \*\/ \}\n\s*\}\n\s*return \[\];\n\s*\}\);/,
  `const [registeredAccounts, setRegisteredAccounts] = useState<UserAccountRecord[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.REGISTERED_ACCOUNTS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { /* ignore */ }
    }
    return [];
  });`
);

code = code.replace(
  /const \[knownUsers, setKnownUsers\] = useState<AuthUser\[\]>\(\(\) => \{\n\s*const saved = localStorage\.getItem\(AUTH_KEYS\.KNOWN_USERS\);\n\s*if \(saved\) \{\n\s*try \{ return JSON\.parse\(saved\); \} catch \(e\) \{ \/\* ignore \*\/ \}\n\s*\}\n\s*return \[\];\n\s*\}\);/,
  `const [knownUsers, setKnownUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.KNOWN_USERS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { /* ignore */ }
    }
    return [];
  });`
);

// Explicitly sync to localStorage in signUpWithEmail
code = code.replace(
  /setRegisteredAccounts\(\(prev\) => \[newAccount, \.\.\.prev\.filter\(\(a\) => a\.id !== userId\)]\);\n\s*setKnownUsers\(\(prev\) => \[authUser, \.\.\.prev\.filter\(\(u\) => u\.id !== userId\)]\);\n\s*setCurrentUser\(authUser\);/,
  `setRegisteredAccounts((prev) => {
      const updated = [newAccount, ...prev.filter((a) => a.id !== userId)];
      localStorage.setItem(AUTH_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(updated));
      return updated;
    });
    setKnownUsers((prev) => {
      const updated = [authUser, ...prev.filter((u) => u.id !== userId)];
      localStorage.setItem(AUTH_KEYS.KNOWN_USERS, JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(authUser);
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(authUser));
    localStorage.setItem(AUTH_KEYS.ACTIVE_USER_ID, authUser.id);`
);

// Explicitly sync to localStorage in loginWithEmail
code = code.replace(
  /setRegisteredAccounts\(\(prev\) => \[updatedAccount, \.\.\.prev\.filter\(\(a\) => a\.id !== account\.id\)]\);\n\s*setKnownUsers\(\(prev\) => \[authUser, \.\.\.prev\.filter\(\(u\) => u\.id !== account\.id\)]\);\n\s*setCurrentUser\(authUser\);/,
  `setRegisteredAccounts((prev) => {
      const updated = [updatedAccount, ...prev.filter((a) => a.id !== account.id)];
      localStorage.setItem(AUTH_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(updated));
      return updated;
    });
    setKnownUsers((prev) => {
      const updated = [authUser, ...prev.filter((u) => u.id !== account.id)];
      localStorage.setItem(AUTH_KEYS.KNOWN_USERS, JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(authUser);
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(authUser));
    localStorage.setItem(AUTH_KEYS.ACTIVE_USER_ID, authUser.id);`
);

// Do the same for loginWithGoogle
code = code.replace(
  /setRegisteredAccounts\(\(prev\) => \{\n\s*const existing = prev\.find\(\(a\) => a\.id === user\.id \|\| a\.email\.toLowerCase\(\) === user\.email\.toLowerCase\(\)\);\n\s*if \(existing\) \{\n\s*return prev\.map\(\(a\) =>\n\s*a\.id === existing\.id\n\s*\? \{ \.\.\.a, lastLoginAt: new Date\(\)\.toISOString\(\), avatarUrl: user\.avatarUrl \|\| a\.avatarUrl \}\n\s*: a\n\s*\);\n\s*\}\n\s*const newAccount: UserAccountRecord = \{[\s\S]*?targetYear: 2027,\n\s*\};\n\s*return \[newAccount, \.\.\.prev\];\n\s*\}\);[\s\S]*?setKnownUsers\(\(prev\) => \{\n\s*const updated = \[user, \.\.\.prev\.filter\(\(u\) => u\.id !== user\.id\)\];\n\s*return updated;\n\s*\}\);\n\s*setCurrentUser\(user\);/,
  `setRegisteredAccounts((prev) => {
      const existing = prev.find((a) => a.id === user.id || a.email.toLowerCase() === user.email.toLowerCase());
      let updated;
      if (existing) {
        updated = prev.map((a) =>
          a.id === existing.id
            ? { ...a, lastLoginAt: new Date().toISOString(), avatarUrl: user.avatarUrl || a.avatarUrl }
            : a
        );
      } else {
        const newAccount: UserAccountRecord = {
          id: user.id,
          name: user.name,
          email: cleanEmail,
          passwordHash: '',
          avatarUrl: user.avatarUrl,
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          targetExam: 'JEE Advanced 2027 (AIR < 500)',
          targetYear: 2027,
        };
        updated = [newAccount, ...prev];
      }
      localStorage.setItem(AUTH_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(updated));
      return updated;
    });

    setKnownUsers((prev) => {
      const updated = [user, ...prev.filter((u) => u.id !== user.id)];
      localStorage.setItem(AUTH_KEYS.KNOWN_USERS, JSON.stringify(updated));
      return updated;
    });

    setCurrentUser(user);
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.ACTIVE_USER_ID, user.id);`
);

fs.writeFileSync('src/context/AppContext.tsx', code);
