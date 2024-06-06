import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { user_id, selected_employee } = await readBody(event);

        const admin_user = await prisma.Users.findUnique({
            select: {
                employeeID: true
            },
            where: {
                id: user_id
            }
        });

        if(!admin_user.employeeID) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            });
        }

        // ! ----------------------------------------------------------------------------------------------------

        if(!selected_employee.id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing field'
            });
        }

        try {
            const deleteEmployeeSalary = prisma.EmployeeSalary.deleteMany({
                where: {
                    employeesID: selected_employee.id
                }
            });
            const deleteContactAddress = prisma.EmployeeContactAddress.delete({
                where: {
                    employeesID: selected_employee.id
                }
            });
            const deleteEmployeeAccounts = prisma.EmployeeAccounts.delete({
                where: {
                    employeesID: selected_employee.id
                }
            });
            const deleteEmployeeProfile = prisma.EmployeeProfile.delete({
                where: {
                    employeesID: selected_employee.id
                }
            });
            const deleteEmployeeEmployment = prisma.EmployeeEmployment.delete({
                where: {
                    employeesID: selected_employee.id
                }
            });
            const deleteEmployee = prisma.Employees.delete({
                where: {
                    id: selected_employee.id
                },
            });

            const [deleted_employee_salary, deleted_contact_address, deleted_employee_accounts, deleted_employee_profile, deleted_employee_employment, deleted_employee] = await prisma.$transaction([deleteEmployeeSalary, deleteContactAddress, deleteEmployeeAccounts, deleteEmployeeProfile, deleteEmployeeEmployment, deleteEmployee]);

            return {
                status: 'deleted',
                data: {
                    employee: deleted_employee
                }
            }
        } catch(error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError
                || error instanceof Prisma.PrismaClientRustPanicError || error instanceof Prisma.PrismaClientInitializationError
                || error instanceof Prisma.PrismaClientValidationError) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Database connection, authentication, validation etc. error'
                });
            }
        }


    } catch(error) {
        console.error(error);

        return error;
    }
});