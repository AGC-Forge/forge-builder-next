#!/bin/bash
# ============================================================
# CRITICAL FIX: Clear Next.js build cache
# Run this AFTER copying the fixed files.
#
# The error "Server Action was not found on the server" is caused
# by a stale .next cache that has old Server Action IDs that no
# longer match the rebuilt module graph.
# ============================================================

echo "Clearing Next.js build cache..."

# Remove .next directory (contains stale server action IDs)
rm -rf .next

# Remove node_modules/.cache if exists
rm -rf node_modules/.cache

# Also clear turbopack cache if using turbo
rm -rf .turbo

echo "✓ Cache cleared!"
echo ""
echo "Now rebuild with:"
echo "  pnpm run build"
echo "  # or for development:"
echo "  pnpm run dev:safe"
echo ""
echo "If error still occurs in production (Vercel):"
echo "  1. Go to Vercel Dashboard → your project"
echo "  2. Settings → General → scroll to 'Build & Development Settings'"
echo "  3. Click 'Clear Build Cache' button"
echo "  4. Re-deploy"
