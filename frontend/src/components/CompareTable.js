import React, { useContext, useState } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { Markup } from "./utils/Markup";
import { Pagination, usePagination } from "./utils/Pagination";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { Hint } from "./utils/Text";

const MarkupEntry = ({ row, hypothesis, reference }) => {
  const markupState = useState();
  return (
    <Tr hover striped>
      <Td loose center>
        {row}
      </Td>
      <Td loose>
        <Markup markups={reference} markupState={markupState} />
      </Td>
      <Td loose>
        <Markup markups={hypothesis} markupState={markupState} />
      </Td>
    </Tr>
  );
};

const ComparisonDisplay = ({ page, size, numPages, setPage, setSize, comparisons }) => {
  const Pages = (
    <div className="flex justify-center p-4">
      <Pagination page={page} size={size} numPages={numPages} setPage={setPage} setSize={setSize} />
    </div>
  );
  return (
    <TableWrapper>
      {Pages}
      <Table>
        <Thead>
          <Th />
          <Th>references</Th>
          <Th>predictions</Th>
        </Thead>
        <Tbody>
          {comparisons
            .slice((page - 1) * size, page * size)
            .map(([index, reference, hypothesis]) => (
              <MarkupEntry key={index} row={index} reference={reference} hypothesis={hypothesis} />
            ))}
        </Tbody>
      </Table>
      {Pages}
    </TableWrapper>
  );
};

const CompareTable = ({ comparisons }) => {
  const { page, setPage, size, setSize, numPages } = usePagination(comparisons.length);
  const { minOverlap } = useContext(SettingsContext);
  const numberedComparisons = comparisons.map((el, i) => [i + 1, ...el]);

  return (
    <>
      <Hint type="info" noicon>{`Minimum Overlap Highlighted: ${minOverlap} grams`}</Hint>
      <ComparisonDisplay
        page={page}
        size={size}
        numPages={numPages}
        setPage={setPage}
        setSize={setSize}
        comparisons={numberedComparisons}
      />
    </>
  );
};

export { CompareTable };
