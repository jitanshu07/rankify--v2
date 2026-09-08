const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// Imports
code = code.replace(
  /import \{ \n\s*CheckSquare,/,
  "import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';\nimport {\n  GripVertical,\n  CheckSquare,"
);

// AppContext extraction
code = code.replace(
  /editTodo,\n\s*deleteTodo,/,
  "editTodo,\n    reorderTodos,\n    deleteTodo,"
);

// handleDragEnd function
const handleDragEndFn = `
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    reorderTodos(result.source.index, result.destination.index);
  };
`;

code = code.replace(
  /const handleAddTodo = \(e: React\.FormEvent\) => \{/,
  handleDragEndFn + "\n  const handleAddTodo = (e: React.FormEvent) => {"
);


// Replace mapping with DragDropContext
const listContainerRegex = /<div className="space-y-2">\n\s*\{filteredTodos\.length === 0 \? \([\s\S]*?<\/div>\n\s*\) : \(\n\s*filteredTodos\.map\(\(todo\) => \{/m;

const replacementStart = `<div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-800 bg-[#121A27]/50">
            <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No tasks to display</p>
            <p className="text-xs text-slate-500">Add tasks above or load an AIR routine template.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredTodos.map((todo, index) => {`;

code = code.replace(listContainerRegex, replacementStart);

// Draggable wrapper
code = code.replace(
  /return \(\n\s*<div\n\s*key=\{todo\.id\}\n\s*className=\{\`flex items-center justify-between p-3\.5 rounded-2xl border transition-all \$\{/,
  `return (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={\`flex items-center justify-between p-3.5 rounded-2xl border transition-all \${
                            snapshot.isDragging ? 'shadow-2xl shadow-blue-500/20 z-50 ring-2 ring-blue-500 scale-[1.02]' : ''
                          } \${`
);

// Drag handle
code = code.replace(
  /<div className="flex items-center gap-3 min-w-0 flex-1">\n\s*<input/,
  `<div className="flex items-center gap-3 min-w-0 flex-1">
                          <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <input`
);

// Closing tags
code = code.replace(
  /<\/div>\n\s*\);\n\s*\}\)\n\s*\)\}\n\s*<\/div>/,
  `</div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>`
);


fs.writeFileSync('src/screens/TodoScreen.tsx', code);
