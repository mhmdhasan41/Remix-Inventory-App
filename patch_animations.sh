#!/bin/bash
cat src/layouts/AppLayout.tsx | awk '
/import React, { useState, useEffect, KeyboardEvent } from '\''react'\'';/ {
    print "import React, { useState, useEffect, KeyboardEvent } from '\''react'\'';";
    print "import { motion } from '\''motion/react'\'';";
    next;
}
/            {children}/ {
    print "            <motion.div";
    print "              key={location.pathname}";
    print "              initial={{ opacity: 0, y: 15 }}";
    print "              animate={{ opacity: 1, y: 0 }}";
    print "              exit={{ opacity: 0, y: -15 }}";
    print "              transition={{ duration: 0.3 }}";
    print "              style={{ width: '\''100%'\'' }}";
    print "            >";
    print "              {children}";
    print "            </motion.div>";
    next;
}
{ print; }
' > src/layouts/AppLayout.tsx.new
mv src/layouts/AppLayout.tsx.new src/layouts/AppLayout.tsx
