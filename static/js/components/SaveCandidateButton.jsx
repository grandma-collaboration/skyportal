import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { useForm, Controller } from "react-hook-form";
import Button from "./Button";

import * as sourceActions from "../ducks/source";
import FormValidationError from "./FormValidationError";

const SaveCandidateButton = ({ candidate, userGroups, filterGroups }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Dialog logic:

  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { handleSubmit, errors, reset, control, getValues } = useForm();

  useEffect(() => {
    reset({
      group_ids: userGroups.map((userGroup) =>
        filterGroups.map((g) => g.id).includes(userGroup.id)
      ),
    });
  }, [reset, userGroups, filterGroups, candidate]);

  const [filteredGroupNames, setFilteredGroupNames] = useState("");

  useEffect(() => {
    if (filterGroups.length <= 3) {
      setFilteredGroupNames(
        filterGroups
          .map((g) => {
            let name = g.nickname
              ? g.nickname.substring(0, 15)
              : g.name.substring(0, 15);
            if (name.length > 15) {
              name += "...";
            }
            return name;
          })
          .join(", ")
      );
    } else {
      setFilteredGroupNames("selected groups");
    }
  }, [filterGroups]);

  const handleClickOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const validateGroups = () => {
    const formState = getValues({ nest: true });
    return formState.group_ids?.filter((value) => Boolean(value)).length >= 1;
  };

  const onSubmitGroupSelectSave = async (data) => {
    setIsSubmitting(true);
    data.id = candidate.id;
    const groupIDs = userGroups.map((g) => g.id);
    const selectedGroupIDs = groupIDs?.filter((ID, idx) => data.group_ids[idx]);
    data.group_ids = selectedGroupIDs;
    const result = await dispatch(sourceActions.saveSource(data));
    if (result.status === "success") {
      reset();
      setDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  // Split button logic (largely copied from
  // https://material-ui.com/components/button-group/#split-button):

  const options = [`Save to ${filteredGroupNames}`, "Select groups & save"];

  const [splitButtonMenuOpen, setSplitButtonMenuOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClickMainButton = async () => {
    if (selectedIndex === 0) {
      setIsSubmitting(true);
      const data = {
        id: candidate.id,
        group_ids: filterGroups.map((g) => g.id),
      };
      await dispatch(sourceActions.saveSource(data));
      setIsSubmitting(false);
    } else if (selectedIndex === 1) {
      handleClickOpenDialog();
    }
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setSplitButtonMenuOpen(false);
  };

  const handleToggleSplitButtonMenu = () => {
    setSplitButtonMenuOpen((prevOpen) => !prevOpen);
  };

  const handleCloseSplitButtonMenu = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setSplitButtonMenuOpen(false);
  };

  return (
    <div>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
      >
        <Button
          onClick={handleClickMainButton}
          name={`initialSaveCandidateButton${candidate.id}`}
          data-testid={`saveCandidateButton_${candidate.id}`}
          disabled={isSubmitting}
          size="small"
        >
          {options[selectedIndex]}
        </Button>
        <Button
          size="small"
          aria-controls={splitButtonMenuOpen ? "split-button-menu" : undefined}
          aria-expanded={splitButtonMenuOpen ? "true" : undefined}
          aria-label="Save as Source"
          aria-haspopup="menu"
          name={`saveCandidateButtonDropDownArrow${candidate.id}`}
          onClick={handleToggleSplitButtonMenu}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={splitButtonMenuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleCloseSplitButtonMenu}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      name={`buttonMenuOption${candidate.id}_${option}`}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        style={{ position: "fixed" }}
      >
        <DialogTitle>Select one or more groups:</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmitGroupSelectSave)}>
            {errors.group_ids && (
              <FormValidationError message="Select at least one group." />
            )}
            {userGroups.map((userGroup, idx) => (
              <FormControlLabel
                key={userGroup.id}
                control={
                  <Controller
                    render={({ onChange, value }) => (
                      <Checkbox
                        onChange={(event) => onChange(event.target.checked)}
                        checked={value}
                        data-testid={`saveCandGroupCheckbox-${userGroup.id}`}
                      />
                    )}
                    name={`group_ids[${idx}]`}
                    control={control}
                    rules={{ validate: validateGroups }}
                    defaultValue={filterGroups
                      .map((g) => g.id)
                      .includes(userGroup.id)}
                  />
                }
                label={userGroup.name}
              />
            ))}
            <br />
            <div style={{ textAlign: "center" }}>
              <Button
                secondary
                type="submit"
                name={`finalSaveCandidateButton${candidate.id}`}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
SaveCandidateButton.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.string,
    passing_group_ids: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  userGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      nickname: PropTypes.string,
    })
  ).isRequired,
  filterGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      nickname: PropTypes.string,
    })
  ).isRequired,
};

export default SaveCandidateButton;
