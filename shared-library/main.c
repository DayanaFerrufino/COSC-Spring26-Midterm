/* main.c
 * Asks the user for two numbers, then runs all four operations on them.
 */

#include <stdio.h>
#include "Mathlib.h"

int main() {
    double a, b;

    printf("Enter first number: ");
    scanf("%lf", &a);
    printf("Enter second number: ");
    scanf("%lf", &b);

    printf("\nResults:\n");
    printf("%.2f + %.2f = %.2f\n", a, b, add(a, b));
    printf("%.2f - %.2f = %.2f\n", a, b, subtract(a, b));
    printf("%.2f * %.2f = %.2f\n", a, b, multiply(a, b));

    if (b == 0.0)
        printf("%.2f / %.2f = undefined (division by zero)\n", a, b);
    else
        printf("%.2f / %.2f = %.2f\n", a, b, divide(a, b));

    return 0;
}