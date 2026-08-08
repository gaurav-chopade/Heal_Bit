package com.healbit.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/** Lightweight, frontend-friendly wrapper around a Spring Data Page. */
public class PageResponse<T> {

    private List<T> content;
    private int page;          // 0-based current page
    private int size;          // page size
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public PageResponse() {}

    public static <T> PageResponse<T> from(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.content = p.getContent();
        r.page = p.getNumber();
        r.size = p.getSize();
        r.totalElements = p.getTotalElements();
        r.totalPages = p.getTotalPages();
        r.first = p.isFirst();
        r.last = p.isLast();
        return r;
    }

    public List<T> getContent() { return content; }
    public void setContent(List<T> content) { this.content = content; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public boolean isFirst() { return first; }
    public void setFirst(boolean first) { this.first = first; }

    public boolean isLast() { return last; }
    public void setLast(boolean last) { this.last = last; }
}
