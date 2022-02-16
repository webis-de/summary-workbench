import React from "react";
import { Range as ReactRange, getTrackBackground } from "react-range";

const Range = ({ defaultValue, setValue, min = 0, max = 100 }) => {
  const [values, setValues] = React.useState([parseInt(defaultValue, 10)]);
  return (
    <div className="h-10 mt-10 max-w-lg flex items-center flex-wrap">
      <ReactRange
        values={values}
        step={1}
        min={min}
        max={max}
        onChange={(v) => setValues(v)}
        onFinalChange={([v]) => setValue(v)}
        renderTrack={({ props, children }) => (
          <div
            className="rounded-full h-2 w-full"
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
            }}
          >
            <div className="flex mb-1 justify-between">
              <div className="flex items-end gap-1">
                <div className="h-4 border border-gray-500 text-sm" />
                <span className="text-xs">{min}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-xs">{max}</span>
                <div className="h-4 border border-gray-500 text-sm" />
              </div>
            </div>
            <div
              className="h-2 w-full rounded-full self-center"
              ref={props.ref}
              style={{
                background: getTrackBackground({
                  values,
                  colors: ["#548bf4", "#d1d5db"],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            className="w-9 h-9 flex justify-center items-center rounded-full bg-white ring-2 ring-gray-500 shadow-gray-700"
            {...props}
            style={{
              ...props.style,
            }}
          >
            <div className="whitespace-nowrap tracking-tighter absolute p-1 rounded-md -top-9 text-white font-bold text-sm bg-blue-500">
              {`${values[0].toFixed(0)} %`}
            </div>
            <div className={"h-2 w-6 rounded-sm bg-blue-500"} />
          </div>
        )}
      />
    </div>
  );
};

export { Range };
