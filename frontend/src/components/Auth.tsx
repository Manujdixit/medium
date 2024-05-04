import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@manujdixit/medium-common";
import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

//trpc
const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();
  const [postInputs, setpostInputs] = useState<SignupInput>({
    name: "",
    username: "",
    password: "",
  });

  async function sendRequest() {
    try {
      // console.log(postInputs);
      const response = await axios.post(
        type === "signup"
          ? `${BACKEND_URL}/api/v1/user/signup`
          : `${BACKEND_URL}/api/v1/user/signin`,
        postInputs
      );
      // console.log(response);
      const jwt = response.data;
      localStorage.setItem("token", jwt);
      navigate("/blogs");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center flex-col items-center">
        <div className="text-4xl font-extrabold mb-1">
          {type === "signin" ? (
            <div>Remeber your credentials?</div>
          ) : (
            <div>Create an account</div>
          )}{" "}
        </div>
        <div className="text-slate-400 text-center mb-6">
          {type === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}
          <Link
            to={type === "signup" ? "/signin" : "/signup"}
            className="underline"
          >
            {type === "signup" ? "Sign in" : "Sign up"}
          </Link>
        </div>
        <div className="mb-4">
          {type === "signup" ? (
            <LabelledInput
              label="Name"
              placeholder="Manuj Dixit"
              onChange={(e) => {
                // setpostInputs((c) => ({
                //   ...c,
                //   name: e.target.value,
                // }));
                setpostInputs({
                  ...postInputs,
                  name: e.target.value,
                });
              }}
            />
          ) : null}
          <div>
            <LabelledInput
              label="Email"
              placeholder="manuj@email.com"
              onChange={(e) => {
                // setpostInputs((c) => ({
                //   ...c,
                //   name: e.target.value,
                // }));
                setpostInputs({
                  ...postInputs,
                  username: e.target.value,
                });
              }}
            />
            <LabelledInput
              label="Password"
              type={"password"}
              placeholder="123456"
              onChange={(e) => {
                // setpostInputs((c) => ({
                //   ...c,
                //   name: e.target.value,
                // }));
                setpostInputs({
                  ...postInputs,
                  password: e.target.value,
                });
              }}
            />
          </div>
        </div>
        <div>
          <button
            onClick={sendRequest}
            type="button"
            className="min-w-80 font-semibold text-white bg-gray-800 hover:bg-gray-900 
                rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
          >
            {type === "signup" ? "Sign up" : "Signin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

interface LabelledInputType {
  type?: string;
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LabelledInput({
  type,
  label,
  placeholder,
  onChange,
}: LabelledInputType) {
  return (
    <div className=" p-1 ">
      <label className="mb-2 text-sm  text-gray-900 dark:text-white font-bold">
        {label}
      </label>
      <input
        type={type || "text"}
        className="min-w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={placeholder}
        onChange={onChange}
        required
      />
    </div>
  );
}
