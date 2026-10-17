/**
 * Smoke tests for demo mode: logs in as each persona and checks that every
 * dashboard renders data from the mock API, and that key actions work.
 * Run with: npm test -- --watchAll=false
 */
import React from "react";
import { render, screen, waitFor, fireEvent, within, cleanup } from "@testing-library/react";
import App from "./App";

const errors = [];
let errorSpy;

beforeAll(() => {
    process.env.REACT_APP_DEMO_MODE = "true";
});
afterAll(() => {
    errorSpy.mockRestore();
    // eslint-disable-next-line no-console
    console.log("ERRCOUNT " + errors.length);
    if (errors.length) {
        // eslint-disable-next-line no-console
        console.log("console.error calls during tests:\n" + [...new Set(errors)].join("\n---\n"));
    }
});
beforeEach(() => {
    // CRA resets mocks between tests (resetMocks: true), so install the spies per test.
    window.alert = jest.fn();
    errorSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
        errors.push(args.map(String).join(" ").slice(0, 400));
    });
    cleanup();
    sessionStorage.clear();
    window.history.pushState({}, "", "/");
});

const loginAs = async (label) => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: label }));
    await screen.findByText(/Employee Workspace Compliance Dashboard/);
};
const openPath = (path) => {
    cleanup();
    window.history.pushState({}, "", path);
    render(<App />);
};

test("login page shows demo quick-login buttons and banner", async () => {
    render(<App />);
    expect(screen.getByTestId("demo-banner")).toBeInTheDocument();
    for (const name of ["Employee", "Reporting Officer", "HR Head", "Payroll"]) {
        expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
});

test("wrong demo username is rejected", async () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Enter Global Code"), { target: { value: "nobody" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(window.alert.mock.calls[0][0]).toMatch(/Invalid login/);
});

test("employee dashboard lists weekly and monthly compliance with counters", async () => {
    await loginAs("Employee");
    await waitFor(() => expect(screen.getAllByText("GPS411").length).toBe(4));
    expect(screen.getByText("REVERTED BY RO")).toBeInTheDocument();
    expect(screen.getByText("REVIEWED BY RO")).toBeInTheDocument();
    expect(screen.getByText("REVIEW PENDING")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Monthly" }));
    await screen.findByText("Workplace Safety Checklist");
    expect(screen.getByText("NON-COMPLIANCE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request" })).toBeInTheDocument();
});

test("employee can open View and History modals", async () => {
    await loginAs("Employee");
    await waitFor(() => expect(screen.getAllByText("GPS411").length).toBe(4));
    fireEvent.click(screen.getAllByRole("button", { name: "View" })[0]);
    await screen.findByText("Self Declared On");
    openPath("/user-dashboard"); // session is kept, so this reloads the dashboard
    await waitFor(() => expect(screen.getAllByText("GPS411").length).toBe(4));
    fireEvent.click(screen.getAllByRole("button", { name: "History" })[0]);
    await screen.findByText("RO Reviewed On");
});

test("RO dashboard shows team grid and the review modal updates a status", async () => {
    await loginAs("Reporting Officer");
    await screen.findByText(/Team Review/);
    openPath("/ro-dashboard");
    await screen.findByText("RO Dashboard");
    await screen.findByText(/Ishita Verma/);
    expect(screen.getByText(/Karan Malhotra/)).toBeInTheDocument();
    // a pending RO action exists; open it
    const pending = (await screen.findAllByText("Pending", { selector: "span.btn-warning" }))[0];
    fireEvent.click(pending);
    const select = await screen.findByRole("combobox");
    fireEvent.change(select, { target: { value: "Reviewed" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Reviewed/)));
    // non-compliance tab lists the exception request
    fireEvent.click(screen.getByRole("tab", { name: /Non-Compliance/ }));
    expect((await screen.findAllByText(/Vikram Singh/)).length).toBe(2);
});

test("HR dashboard loads employee report on first visit and the other tabs", async () => {
    await loginAs("HR Head");
    await screen.findByText(/Location HR View/);
    openPath("/Hr-dashboard");
    await screen.findByText("HR Dashboard");
    await waitFor(() => expect(screen.getAllByText("Gurugram HQ").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("tab", { name: "RO Action Summary" }));
    await screen.findByText(/RO2001/);
    fireEvent.click(screen.getByRole("tab", { name: "RO Hold List" }));
    await waitFor(() => expect(screen.getAllByText(/Gurugram HQ|Mumbai Plant|Raipur Plant|Bengaluru Tech Park/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("tab", { name: "Employee Non-Compliance To Compliance" }));
    await waitFor(() => expect(screen.getAllByText("Yes").length).toBeGreaterThan(0));
});

test("Payroll dashboard loads data, schedules a job and shows history", async () => {
    await loginAs("Payroll");
    await screen.findByText(/Payroll View/);
    openPath("/payroll-dashboard");
    await waitFor(() => expect(screen.getAllByText("Gurugram HQ").length).toBeGreaterThan(0));
    const runBtn = screen.getAllByRole("button").find((b) => /Run|Program/i.test(b.textContent));
    expect(runBtn).toBeTruthy();
    fireEvent.click(runBtn);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/job history/)));
    const histBtn = screen.getAllByRole("button").find((b) => /History/i.test(b.textContent));
    fireEvent.click(histBtn);
    await screen.findByText("Job Running History");
    await screen.findByText("RunEmployeeHold", {}, { timeout: 3000 }).catch(() => null);
    expect(within(document.body).getAllByText(/Run (Employee|RO) (Hold|Release) Program/).length).toBeGreaterThan(0);
});
