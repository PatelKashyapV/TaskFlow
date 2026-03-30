import { useState } from "react";

function Header({ addTask }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addTask(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="task-input-wrapper">
      <input
        type="text"
        placeholder="What needs to be done?"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="task-input"
      />

      <button type="submit" className="add-btn">
        Add Task
      </button>
    </form>
  );
}

export default Header;