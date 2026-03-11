

## Add Show/Hide Password Toggle to Auth Forms

Add an eye icon toggle to password fields in `LoginForm`, `SignupForm`, and `ResetPassword` so users can reveal their password.

### Changes

**1. `src/components/auth/LoginForm.tsx`**
- Add `showPassword` state
- Change input type to `showPassword ? "text" : "password"`
- Wrap input in a `relative` div, add an `Eye`/`EyeOff` icon button inside

**2. `src/components/auth/SignupForm.tsx`**
- Same pattern for the password field

**3. `src/pages/ResetPassword.tsx`**
- Same pattern for both password and confirm password fields

### Implementation Pattern
```tsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <Input type={showPassword ? "text" : "password"} ... className="pr-10" />
  <button type="button" onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

No database or backend changes needed.

