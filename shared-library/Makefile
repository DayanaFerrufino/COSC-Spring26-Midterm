# Makefile for libmath.so — a shared library for basic arithmetic

CC      = gcc
CFLAGS  = -Wall -Wextra -fPIC # -fPIC: position-independent code, required for shared libs
LDFLAGS = -shared # -shared: produce a .so instead of an executable
TARGET  = libmath.so
SRC     = mathlib.c

# Default target: build the shared library
all: $(TARGET)

# Compile the source into a shared library
$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^

# Remove build artifacts
clean:
	rm -f $(TARGET)

.PHONY: all clean