#!/bin/bash
set -e

pnpm build
pnpm exec cap sync android
