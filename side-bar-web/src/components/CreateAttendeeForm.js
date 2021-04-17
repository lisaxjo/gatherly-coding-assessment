import React, { useState } from "react";

const Pronouns = {
  HE_HIS: "He/him",
  SHE_HER: "She/her",
  THEY_THEM: "They/them",
  OTHER: "Other",
};

const CreateAttendeeForm = (props) => {
  const [fullName, setFullName] = useState("");
  const onChangeFullName = (event) => {
    setFullName(event.target.value);
  };
  const [pronouns, setPronouns] = useState("");
  const onChangePronouns = (event) => {
    setPronouns(event.target.value);
  };

  const [pronounsOverride, setPronounsOverride] = useState("");
  const onChangePronounsOverride = (event) => {
    setPronounsOverride(event.target.value);
  };

  const [isMakingRequest, setIsMakingRequest] = useState(false);
  const [hasServerError, setHasServerError] = useState(false);
  const [hasValidationError, setHasValidationError] = useState(false);

  const onSubmit = (event) => {
    try {
      event.preventDefault();
      if (isMakingRequest) return;
      if (!fullName) {
        setHasValidationError(true);
        return;
      }
      setIsMakingRequest(true);
      setHasValidationError(false);
      props
        .onSubmit({
          fullName,
          pronouns: pronouns === Pronouns.OTHER ? pronounsOverride : pronouns,
        })
        .then((response) => {
          console.log("resp", response);
          if (props.onSuccess) props.onSuccess(response);
        });
    } catch (e) {
      console.error("ERRR FORM", e);
      setHasServerError(true);
      setIsMakingRequest(false);
    }
  };

  return (
    <div>
      <form className="flex flex-col" onSubmit={onSubmit}>
        <div className="bg-color-white border-rounded-1 p1_5">
          <div className="pb1">
            <label htmlFor="fullName" className="Form__field flex flex-col">
              <span className="body font-inter-bold color-navy m_5">Name</span>
              <input
                className="Form__input"
                value={fullName}
                placeholder="Enter your name"
                onChange={onChangeFullName}
              />
            </label>
          </div>

          <span className="body font-inter-bold color-navy m_5">Pronouns</span>
          <div className="flex items-center">
            <label className="Form__radio mr1">
              <input
                type="radio"
                value={Pronouns.HE_HIS}
                checked={pronouns === Pronouns.HE_HIS}
                onChange={onChangePronouns}
              />
              <span>{Pronouns.HE_HIS}</span>
            </label>

            <label className="Form__radio mr1">
              <input
                type="radio"
                value={Pronouns.SHE_HER}
                checked={pronouns === Pronouns.SHE_HER}
                onChange={onChangePronouns}
              />
              <span>{Pronouns.SHE_HER}</span>
            </label>

            <label className="Form__radio mr1">
              <input
                type="radio"
                value={Pronouns.THEY_THEM}
                checked={pronouns === Pronouns.THEY_THEM}
                onChange={onChangePronouns}
              />
              <span>{Pronouns.THEY_THEM}</span>
            </label>

            <div className="flex items-center flex-1">
              <div className="pr_5">
                <label>
                  <input
                    className="Form__radio"
                    type="radio"
                    value={Pronouns.OTHER}
                    checked={pronouns === Pronouns.OTHER}
                    onChange={onChangePronouns}
                  />
                  <span className="sr-only">{Pronouns.OTHER}</span>
                </label>
              </div>
              <div className="flex-1">
                <label htmlFor="pronounsOverride" className="sr-only">
                  Custom Pronouns
                </label>
                <input
                  className="Form__input col-12"
                  value={pronounsOverride}
                  name="pronounsOverride"
                  placeholder="Custom"
                  onChange={onChangePronounsOverride}
                  onBlur={() => setPronouns(Pronouns.OTHER)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt1_5">
          <input
            type="submit"
            className="Button--primary"
            disabled={isMakingRequest}
            value={isMakingRequest ? "Submitting..." : "Submit"}
          />
        </div>
      </form>

      {hasServerError ? (
        <p className="small mt1 font-inter color-pewter text-center">
          Something went wrong. Please try again.
        </p>
      ) : null}
      {hasValidationError ? (
        <p className="small mt1 font-inter color-pewter text-center">
          Please fill out all required fields to continue.
        </p>
      ) : null}
    </div>
  );
};

export default CreateAttendeeForm;
