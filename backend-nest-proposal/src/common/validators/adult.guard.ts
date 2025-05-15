import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

@ValidatorConstraint({ name: "AdultGuard", async: false })
export class AdultGuard implements ValidatorConstraintInterface {
    private calculateAge(date: Date) {
        const today = new Date();
        const birth = new Date(date);

        const yearDifference = today.getFullYear() - birth.getFullYear();
        const monthDifference = today.getMonth() - birth.getMonth();
        const dayDifference = today.getDate() - birth.getDate();

        const hasBirthdayAlreadyPassed = monthDifference >= 0 && (monthDifference !== 0 || dayDifference >= 0);
        if (hasBirthdayAlreadyPassed)
            return yearDifference;

        return yearDifference - 1;
    }

    validate(dateString: string, _args: ValidationArguments): boolean {
        const birth = new Date(dateString);
        const age = this.calculateAge(birth);
        return age >= 18;
    }

    defaultMessage(_args: ValidationArguments): string {
        return "Usuário deve ter no mínimo 18 anos.";
    }
}
