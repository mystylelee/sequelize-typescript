import 'reflect-metadata';
import {DataTypeAbstract} from 'sequelize';
import {getSequelizeTypeByDesignType} from "../shared/model-service";
import {ColumnOptions} from "./column-options/column-options";
import {isDataType} from '../../sequelize/data-type';
import {addAttribute} from './attribute-service';

export function Column(dataType: DataTypeAbstract): Function;
export function Column(options: ColumnOptions): Function;
export function Column(target: any, propertyName: string, propertyDescriptor?: PropertyDescriptor): void;
export function Column(...args: any[]): Function|void {

  // In case of no specified options, we infer the
  // sequelize data type by the type of the property
  if (args.length >= 2) {

    const target = args[0];
    const propertyName = args[1];
    const propertyDescriptor = args[2];

    annotate(target, propertyName, propertyDescriptor);
    return;
  }

  return (target: any, propertyName: string, propertyDescriptor?: PropertyDescriptor) => {
    annotate(target, propertyName, propertyDescriptor, args[0]);
  };
}

function annotate(target: any,
                  propertyName: string,
                  propertyDescriptor?: PropertyDescriptor,
                  optionsOrDataType: ColumnOptions|DataTypeAbstract = {}): void {

  let options: ColumnOptions;

  if (isDataType(optionsOrDataType)) {

    options = {
      type: optionsOrDataType as DataTypeAbstract
    };
  } else {

    options = Object.assign({}, optionsOrDataType as ColumnOptions);

    if (!options.type) {
      options.type = getSequelizeTypeByDesignType(target, propertyName);
    }
  }

  if (propertyDescriptor) {
    if (propertyDescriptor.get) {
      options.get = propertyDescriptor.get;
    }
    if (propertyDescriptor.set) {
      options.set = propertyDescriptor.set;
    }
  }

  addAttribute(target, propertyName, options);
}