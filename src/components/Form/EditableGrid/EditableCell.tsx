import { useFormApi } from "@data-driven-forms/react-form-renderer";
import _ from "lodash";

export const EditableCell = (props: any) => {
    const { renderForm } = useFormApi();
    const field: any = _.omit(props?.field, ['label', 'helperText']);

    return (
        <td>
            {props.editing ? (
                <>
                    {renderForm([field])}
                </>
            ) : (
                props.children
            )}
        </td>
    );
};