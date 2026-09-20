import { expect, test } from '@playwright/test';

test('homepage, manifesto, and problem commons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Don't bring us an app idea/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell us something that should work better.' })).toBeVisible();
  await expect(page.getByText('Build an app', { exact: true })).toHaveCount(0);

  await expect(page.getByRole('link', { name: 'Manifesto' }).first()).toBeVisible();
  await page.goto('/manifesto');
  await expect(page.getByRole('heading', { name: 'The ManifestOS Manifesto' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Everyone sees problems. Everyone should be able to solve them.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell us something that should work better.' })).toBeVisible();

  await page.goto('/problems/dad-dog-feeding');
  await expect(page.getByRole('heading', { name: /elderly dad/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'I have this problem too' })).toBeVisible();
  await expect(page.getByText(/Dog Feeding App/i)).toHaveCount(0);
});

test('studio searches commons and asks for the smallest useful solution before a plan', async ({ page }) => {
  await page.goto('/studio?problem=' + encodeURIComponent("My elderly dad can't reliably remember whether the dog has already been fed.") + '&from=dad-dog-feeding');
  await expect(page.getByRole('heading', { name: 'Problem' })).toBeVisible();
  await page.getByRole('button', { name: 'Help understand this' }).click();
  await expect(page.getByRole('heading', { name: 'Understand' })).toBeVisible();
  await page.getByRole('button', { name: 'Show the shared understanding' }).click();
  await expect(page.getByText('Did I understand the problem correctly?')).toBeVisible();
  await page.getByRole('button', { name: 'Search the commons' }).click();
  await expect(page.getByRole('heading', { name: /Has anyone already solved/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use one' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make this solve my version' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Create something different' }).click();
  await expect(page.getByRole('heading', { name: 'What is the smallest useful solution?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Don't build software/i })).toBeVisible();
  await page.getByRole('button', { name: 'A tiny app' }).click();
  await page.getByRole('button', { name: 'Continue with this path' }).click();
  await expect(page.getByRole('heading', { name: /I figured out how your solution should work/i })).toBeVisible({ timeout: 10000 });
});
