const { z } = require('zod');
const disposableDomains = require('disposable-email-domains');

// Convert array to a Set for O(1) instant lookup
const disposableSet = new Set(disposableDomains);

// Extra spam/burner domains and patterns
const customBlockedDomains = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'trashmail.com',
  'getairmail.com',
  'temp-mail.org',
  'throwawaymail.com',
]);

const isDisposableEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return disposableSet.has(domain) || customBlockedDomains.has(domain);
};

const createContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .refine((val) => !isDisposableEmail(val), {
      message: "Temporary/disposable email addresses are not allowed. Please provide a valid email.",
    }),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters long"),
  // Honeypot field: real users leave it empty; bots auto-fill it
  website_url: z.string().optional(),
});

module.exports = {
  createContactSchema,
  isDisposableEmail
};
