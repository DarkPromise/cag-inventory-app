"use client";

import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Button } from "@mui/material";
import { InventoryData, InventoryFilters, InventoryItem } from "../../types/Common";
import { formatCurrency } from "../../utils/formatCurrency.ts";

const inventoryTableColumns = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Price",
    key: "price",
  },
  {
    title: "Category",
    key: "category",
  },
  {
    title: "Last Updated",
    key: "last_updated_dt",
  },
];

export interface InventoryTableProps {
  data: InventoryData;
  isLoading?: boolean;
}

export const InventoryTable = (props: InventoryTableProps) => {
  /** Pagination */
  // const [currentPage, setCurrentPage] = React.useState(props.pagination?.page || 1);
  // const [itemsPerPage, setItemsPerPage] = React.useState(props.pagination?.limit || 10);

  return props.isLoading ? (
    <Box className="text-primary flex flex-grow flex-col items-center justify-center py-10 align-middle">
      <CircularProgress size={"5rem"} />
      <Typography className="pt-4 dark:text-white" variant="body1">
        Loading...
      </Typography>
    </Box>
  ) : (
    <TableContainer className="border border-solid border-gray-500">
      <Table sx={{ minWidth: 650 }} aria-label="inventory table">
        <TableHead>
          <TableRow className="">
            {inventoryTableColumns.map((column) => (
              <TableCell key={column.key}>{column.title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.items && props.data.items.length > 0 ? (
            props.data.items.map((row, index) => (
              <TableRow className="" key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{formatCurrency(row.price)}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.last_updated_dt}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={inventoryTableColumns.length} className="text-center">
                No items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/** Additional Row */}
      <Box className="flex flex-row items-center justify-between p-4">
        {/** Page */}
        {/* <Box className="flex flex-row">
          <Typography className="flex h-full items-center">
            Page {currentPage} of {Math.ceil(props.data.items.length / itemsPerPage)}
          </Typography>
        </Box> */}
        {/** Page Controls (Arrows) */}
        {/* <Box className="flex flex-row items-center gap-2">
          <Button variant="contained" color="primary" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            {"<"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={currentPage === Math.ceil(props.data.items.length / itemsPerPage)}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            {">"}
          </Button>
        </Box> */}
        {/** Total Price (Of the results) */}
        <Box>
          <Typography className="" variant="body2">
            Total Price: {formatCurrency(props.data.total_price)}
          </Typography>
        </Box>
      </Box>
    </TableContainer>
  );
};

export default InventoryTable;
