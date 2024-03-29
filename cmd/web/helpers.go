package main

import (
	"context"
	"encoding/json"
	"io/fs"
	"log/slog"
	"net/http"

	"github.com/amrojjeh/arabic/data"
	"github.com/amrojjeh/kalam"
)

func (app *application) clientError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func (app *application) serverError(w http.ResponseWriter, err error) {
	app.logger.Error("server error", slog.String("error", err.Error()))
	http.Error(w, http.StatusText(http.StatusInternalServerError),
		http.StatusInternalServerError)
}

func excerptFromContext(ctx context.Context) kalam.Excerpt {
	return ctx.Value(excerptKey).(kalam.Excerpt)
}

func excerptIdFromContext(ctx context.Context) int {
	return ctx.Value(excerptIdKey).(int)
}

func iteratorFromContext(ctx context.Context) kalam.ExcerptIterator {
	return ctx.Value(iteratorKey).(kalam.ExcerptIterator)
}

func (app *application) GetQuestions() error {
	names, err := fs.Glob(data.Files, "*.json")
	if err != nil {
		return err
	}

	for _, n := range names {
		e := kalam.Excerpt{}
		file, err := data.Files.ReadFile(n)
		if err != nil {
			return err
		}
		err = json.Unmarshal(file, &e)
		if err != nil {
			return err
		}

		app.logger.Info("loaded question", slog.String("name", e.Name))
		app.excerpts = append(app.excerpts, e)
	}
	return nil
}
