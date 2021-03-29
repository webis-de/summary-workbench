import React, { useContext, useEffect, useReducer, useRef, useState } from "react";
import { FaRegFile } from "react-icons/fa";

import { MetricsContext } from "../contexts/MetricsContext";
import { OneHypRef } from "./OneHypRef";
import { Result } from "./Result";
import { Saved } from "./Saved";
import { Settings } from "./Settings";
import { Upload } from "./Upload";
import { Button } from "./utils/Button";
import { Card } from "./utils/Card";
import { CenterLoading } from "./utils/Loading";

const Evaluate = () => {
  const [savedKey, reloadSaved] = useReducer((oldKey) => !oldKey, true);
  const [calculateResult, setCalculateResult] = useState(null);
  const [rerender, toggleRerender] = useReducer((v) => !v, false);

  const { loading, metrics, reload } = useContext(MetricsContext);
  useEffect(() => toggleRerender(), [calculateResult]);

  const resultRef = useRef(null);

  return (
    <>
      {loading ? (
        <CenterLoading />
      ) : (
        <>
          {!metrics ? (
            <Button className="uk-container" onClick={reload}>Retry</Button>
          ) : (
            <div className="uk-container uk-container-expand uk-margin-medium-top uk-margin-large-top@l ">
              <div className="uk-flex uk-flex-between">
                <div style={{ flexBasis: "60%", maxWidth: "60%" }}>
                  <Card
                    title={
                      <div className="card-title uk-flex">
                        <FaRegFile />
                        <ul
                          className="uk-tab dark-tab"
                          data-uk-tab
                          uk-tab="connect: #choose-upload;"
                          style={{ margin: "0" }}
                        >
                          <li>
                            <a href="/#">Upload files</a>
                          </li>
                          <li>
                            <a href="/#">Single Example</a>
                          </li>
                        </ul>
                      </div>
                    }
                  >
                    <ul id="choose-upload" className="uk-switcher">
                      <li>
                        <Upload className="uk-margin" setCalculateResult={setCalculateResult} />
                      </li>
                      <li>
                        <OneHypRef className="uk-margin" />
                      </li>
                    </ul>
                  </Card>
                </div>
                <div style={{ minWidth: "10px" }} />
                <div style={{ flexBasis: "37%" }}>
                  <Settings className="uk-margin" />
                </div>
              </div>
              <div
                ref={resultRef}
                style={{ scrollMarginTop: "80px" }}
                className="uk-margin-large-top"
              />
              <Result
                key={rerender}
                resultRef={resultRef}
                className="uk-margin"
                calculateResult={calculateResult}
                setCalculateResult={setCalculateResult}
                reloadSaved={reloadSaved}
              />
              <Saved className="uk-margin" key={savedKey + 2} reloadSaved={reloadSaved} />
            </div>
          )}
        </>
      )}
    </>
  );
};

export { Evaluate };
