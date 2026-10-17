import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the login page", () => {
	window.history.pushState({}, "", "/");
	render(<App />);
	expect(screen.getByPlaceholderText("Enter Global Code")).toBeInTheDocument();
	expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});
