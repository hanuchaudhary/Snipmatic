import React from "react";
import Pill from "../Pill";

export function ProblemSection() {
  return (
    <section className="h-[calc(100vh-10rem) border-b">
      <div className="md:py-20 py-14 col-span-1 px-5 border-b">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Struggling to Create Viral Content?
        </h2>
      </div>
      <div className="">
        <div className="md:p-8 p-4 border-b text-left">
          <p className="text-muted-foreground md:text-xl md:block flex flex-col text-base font-semibold gap-1">
            <Pill
              classname="dark:text-blue-400 text-blue-800 bg-blue-500/30"
              text="Hours of Editing"
            />{" "}
            Traditional video editing takes hours of your time that could be
            spent creating.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="md:p-8 p-4 text-left border-r">
            <p className="text-muted-foreground md:text-xl md:block flex flex-col text-base font-semibold gap-1">
              <span className="dark:text-white text-black">
                <Pill
                  classname="dark:text-purple-400 text-purple-800 bg-purple-500/30"
                  text="Complex Software"
                />{" "}
              </span>
              Professional editing software has a steep learning curve and is
              hard to master.
            </p>
          </div>
          <div className="md:p-8 p-4 text-left">
            <p className="text-muted-foreground md:text-xl md:block flex flex-col text-base font-semibold gap-1">
              <span className="dark:text-white text-black">
                <Pill
                  classname="dark:text-green-400 text-green-800 bg-green-500/30"
                  text="Manual Upload"
                />{" "}
              </span>
              Converting and uploading to multiple platforms manually is tedious
              and error-prone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
