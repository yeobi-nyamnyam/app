import { fireEvent, render, screen } from "@testing-library/react-native";
import { SortSheet } from "./SortSheet";

const options = [
  { value: "latest", label: "최신순" },
  { value: "distance", label: "거리순" },
];

describe("SortSheet", () => {
  it("모든 옵션 라벨을 렌더한다", async () => {
    await render(
      <SortSheet
        visible
        options={options}
        selectedValue="latest"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("최신순")).toBeTruthy();
    expect(screen.getByText("거리순")).toBeTruthy();
  });

  it("옵션을 누르면 onSelect에 해당 value를 전달하고 onClose도 호출한다", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();

    await render(
      <SortSheet
        visible
        options={options}
        selectedValue="latest"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText("거리순"));

    expect(onSelect).toHaveBeenCalledWith("distance");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
