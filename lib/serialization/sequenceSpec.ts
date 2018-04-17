// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
import { TypeSpec, createValidationErrorMessage, createValidationWarningMessage } from "./typeSpec";
import { SerializationOptions, log } from "./serializationOptions";
import { PropertyPath } from "./propertyPath";
import { HttpPipelineLogLevel } from "../httpPipelineLogLevel";

export interface SequenceTypeSpec<TSerializedElement, TDeserializedElement> extends TypeSpec<TSerializedElement[], TDeserializedElement[]> {
  /**
   * The TypeSpec that defines each element in this SequenceTypeSpec.
   */
  elementSpec: TypeSpec<TSerializedElement, TDeserializedElement> | string;
}

/**
 * A type specification that describes how to validate and serialize a Sequence of elements.
 */
export function sequenceSpec<TSerializedElement, TDeserializedElement>(elementSpec: TypeSpec<TSerializedElement, TDeserializedElement> | string): SequenceTypeSpec<TSerializedElement, TDeserializedElement> {
  return {
    specType: `Sequence`,

    elementSpec: elementSpec,

    serialize(propertyPath: PropertyPath, value: TDeserializedElement[], options: SerializationOptions): TSerializedElement[] {
      let result: TSerializedElement[];
      if (!Array.isArray(value)) {
        if (options && options.serializationStrictTypeChecking) {
          const errorMessage: string = createValidationErrorMessage(propertyPath, value, "an Array");
          log(options, HttpPipelineLogLevel.ERROR, errorMessage);
          throw new Error(errorMessage);
        } else {
          log(options, HttpPipelineLogLevel.WARNING, createValidationWarningMessage(propertyPath, value, "an Array"));
        }

        result = value;
      } else {
        let elementTypeSpec: TypeSpec<TSerializedElement, TDeserializedElement>;
        if (typeof elementSpec === "string") {
          if (!options.compositeSpecDictionary || !options.compositeSpecDictionary[elementSpec]) {
            const errorMessage = `Missing composite specification entry in composite type dictionary for type named "${elementSpec}" at property ${propertyPath}.`;
            log(options, HttpPipelineLogLevel.ERROR, errorMessage);
            throw new Error(errorMessage);
          }
          elementTypeSpec = options.compositeSpecDictionary[elementSpec] as TypeSpec<TSerializedElement, TDeserializedElement>;
        } else {
          elementTypeSpec = elementSpec;
        }

        result = [];
        for (let i = 0; i < value.length; i++) {
          result[i] = elementTypeSpec.serialize(propertyPath.concat([i.toString()]), value[i], options);
        }
      }
      return result;
    },

    deserialize(propertyPath: PropertyPath, value: TSerializedElement[], options: SerializationOptions): TDeserializedElement[] {
      let result: TDeserializedElement[];
      if (!Array.isArray(value)) {
        if (options && options.deserializationStrictTypeChecking) {
          const errorMessage: string = createValidationErrorMessage(propertyPath, value, "an Array");
          log(options, HttpPipelineLogLevel.ERROR, errorMessage);
          throw new Error(errorMessage);
        } else {
          log(options, HttpPipelineLogLevel.WARNING, createValidationWarningMessage(propertyPath, value, "an Array"));
        }

        result = value;
      } else {
        let elementTypeSpec: TypeSpec<TSerializedElement, TDeserializedElement>;
        if (typeof elementSpec === "string") {
          if (!options.compositeSpecDictionary || !options.compositeSpecDictionary[elementSpec]) {
            const errorMessage = `Missing composite specification entry in composite type dictionary for type named "${elementSpec}" at property ${propertyPath}.`;
            log(options, HttpPipelineLogLevel.ERROR, errorMessage);
            throw new Error(errorMessage);
          }
          elementTypeSpec = options.compositeSpecDictionary[elementSpec] as TypeSpec<TSerializedElement, TDeserializedElement>;
        } else {
          elementTypeSpec = elementSpec;
        }

        result = [];
        for (let i = 0; i < value.length; i++) {
          result[i] = elementTypeSpec.deserialize(propertyPath.concat([i.toString()]), value[i], options);
        }
      }
      return result;
    }
  };
}