// tests/unit/components.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import StatCard from "@/components/dashboard/StatCard";
import DeleteConfirm from "@/components/ui/DeleteConfirm";

// ── StatCard Tests ─────────────────────────────────────────────────────────────

describe("StatCard component", () => {
  it("renders the title correctly", () => {
    render(<StatCard title="Total Rooms" value={5} emoji="🏠" />);
    expect(screen.getByText("Total Rooms")).toBeInTheDocument();
  });

  it("renders the numeric value", () => {
    render(<StatCard title="Active Devices" value={12} emoji="⚡" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders the emoji", () => {
    render(<StatCard title="Schedules" value={3} emoji="⏰" />);
    expect(screen.getByText("⏰")).toBeInTheDocument();
  });

  it("renders an optional subtitle", () => {
    render(<StatCard title="Devices" value={8} emoji="💡" subtitle="Connected devices" />);
    expect(screen.getByText("Connected devices")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<StatCard title="Rooms" value={3} emoji="🏠" />);
    expect(screen.queryByText("Connected devices")).not.toBeInTheDocument();
  });

  it("renders a string value as well as a number", () => {
    render(<StatCard title="Status" value="Online" emoji="✅" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });
});

// ── DeleteConfirm Tests ────────────────────────────────────────────────────────

describe("DeleteConfirm component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Delete Room",
    message: "Are you sure you want to delete this room?",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<DeleteConfirm {...defaultProps} />);
    expect(screen.getByText("Delete Room")).toBeInTheDocument();
  });

  it("renders the message", () => {
    render(<DeleteConfirm {...defaultProps} />);
    expect(screen.getByText("Are you sure you want to delete this room?")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<DeleteConfirm {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Delete Room")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = jest.fn();
    render(<DeleteConfirm {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and onClose when Delete is clicked", async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(<DeleteConfirm {...defaultProps} onClose={onClose} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText("🗑️ Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the X button is clicked", async () => {
    const onClose = jest.fn();
    render(<DeleteConfirm {...defaultProps} onClose={onClose} />);
    // The X icon button
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons.find((b) => !b.textContent?.includes("Delete") && !b.textContent?.includes("Cancel"));
    if (closeBtn) {
      await userEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
