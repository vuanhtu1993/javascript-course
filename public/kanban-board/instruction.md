### Exercise: Custom Drag and Drop Kanban Board

Create a web application kanban board thực hiện:

- Tạo Kanban board với các cột trạng thái
- Hỗ trợ drag & drop tasks giữa các cột
- Animation khi di chuyển task
- Lưu trạng thái vào localStorage

**Hint:**

- Sử dụng HTML5 Drag and Drop API
- Implement custom drag image
- Dùng transition/animation cho smooth UX
- Áp dụng event delegation cho performance

## Key Features Implemented

### Column Structure

- Three columns: To Do, In Progress, and Done
- Each column can hold multiple tasks
- Add task button for each column

### Event Drag and Drop

- HTML5 native drag and drop API
- Visual feedback during dragging (opacity and scale changes)
- Column highlighting when dragging over it
- Smooth animations during transitions

### State Management

- Persistent storage using localStorage
- State updates when:
  - Adding new tasks
  - Moving tasks between columns
- Automatic state recovery on page reload
