const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

code = code.split('                      )}\n                    </Draggable>\n                  );\n                })}\n                {provided.placeholder}').join('                      )}\n                    </Draggable>\n                  );\n                })}\n                {provided.placeholder}');

// wait, the sed deleted some lines earlier. let me inspect what's at line 531 exactly
