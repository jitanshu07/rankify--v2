const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// I see my DragDropContext replacement from earlier failed, it didn't match. Let's fix that.
code = code.replace(
  /filteredTodos\.map\(\(todo\) => \{/,
  `<DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredTodos.map((todo, index) => {`
);

code = code.replace(
  /<\/div>\n\s*\);\n\s*\}\)\n\s*\{provided\.placeholder\}\n\s*<\/div>/,
  `</div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>`
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
